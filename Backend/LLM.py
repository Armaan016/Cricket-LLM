import sys
import json
import torch
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

context_model = SentenceTransformer("all-MiniLM-L6-v2").to('cuda')

model_id = "t5-small"
t5_model = AutoModelForSeq2SeqLM.from_pretrained(
    model_id,
    device_map="cuda", 
    torch_dtype="auto"
).to('cuda')
tokenizer = AutoTokenizer.from_pretrained(model_id)

data = pd.read_json('../Datasets/combined_embeddings.json')
embeddings = np.array(data['embedding'].to_list())
embeddings = torch.tensor(embeddings, dtype=torch.float32).to('cuda')

def find_closest_contexts(query, data, embeddings, k=2):
    query_vector = torch.tensor(context_model.encode(query)).to('cuda')
    dot_scores = util.dot_score(query_vector, embeddings)
    top_contexts = torch.topk(dot_scores, k=k)
    relevant = data.iloc[top_contexts.indices.tolist()[0]]['chunk'].tolist()
    return relevant

def format_history(history):
    formatted_history = ""
    for item in history:
        formatted_history += f"Previous Answer: {item['answer']}\n\n"
    return formatted_history

def answer_question(question, data, chat_history):
    formatted_history = format_history(chat_history)
    top_contexts = find_closest_contexts(question, data, embeddings)

    context = " ".join(top_contexts)
    
    input_text = f"{formatted_history}Context: {context}\nQuestion: {question}\n"
    # print(input_text)

    pipe = pipeline(
        "text2text-generation",
        model=t5_model,
        tokenizer=tokenizer,
        # device=0  # Use GPU if available
    )
    
    generation_args = {
        "max_length": 200,
        "num_return_sequences": 1,
        "early_stopping": True,
    }
    
    output = pipe(input_text, **generation_args)
    return output[0]['generated_text'].strip()

if __name__ == "__main__":
    question = sys.argv[1]
    # question = "When was Virat Kohli born?"
    chat_history_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
    chat_history = json.loads(chat_history_json)
    answer = answer_question(question, data, chat_history)
    print("Answer:", answer)
