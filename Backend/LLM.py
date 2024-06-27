import sys
import json
import torch
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Load the context model for embedding
context_model = SentenceTransformer("all-MiniLM-L6-v2").to('cuda')

# Define Falcon model details
model_name = "tiiuae/falcon-40b"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
falcon_model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    trust_remote_code=True,
    device_map="auto"
)

# Load the text generation pipeline
text_gen_pipeline = pipeline(
    "text-generation",
    model=falcon_model,
    tokenizer=tokenizer,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Load dataset embeddings
data = pd.read_json('../Datasets/combined_embeddings.json')
embeddings = np.array(data['embedding'].to_list())
embeddings = torch.tensor(embeddings, dtype=torch.float32).to('cuda')

def find_closest_contexts(query, data, embeddings, k=2):
    query_vector = context_model.encode(query, convert_to_tensor=True)
    dot_scores = util.dot_score(query_vector, embeddings)
    top_contexts = torch.topk(dot_scores, k=k)
    relevant = data.iloc[top_contexts.indices.tolist()[0]]['chunk'].tolist()
    return relevant

def format_history(history):
    formatted_history = ""
    for item in history:
        formatted_history += f"Previous Answer: {item['answer']}\n\n"
    return formatted_history

def generate_text(prompt, max_length=200, top_k=10, num_return_sequences=1):
    sequences = text_gen_pipeline(
        prompt,
        do_sample=True,
        top_k=top_k,
        num_return_sequences=num_return_sequences,
        eos_token_id=tokenizer.eos_token_id,
        max_length=max_length,
    )
    return sequences

def answer_question(question, data, chat_history):
    formatted_history = format_history(chat_history)
    top_contexts = find_closest_contexts(question, data, embeddings)

    context = " ".join(top_contexts)
    input_text = f"{formatted_history}Context: {context}\nQuestion: {question}\n"

    # Generate the answer using Falcon
    sequences = generate_text(input_text)
    return sequences[0]['generated_text'].strip()

if __name__ == "__main__":
    question = "Who is Virat Kohli?"
    chat_history_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
    chat_history = json.loads(chat_history_json)
    answer = answer_question(question, data, chat_history)
    print("Answer:", answer)
