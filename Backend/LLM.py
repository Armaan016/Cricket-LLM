import sys
import json
import torch
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, pipeline

context_model = SentenceTransformer("all-MiniLM-L6-v2").to('cuda')

model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
tokenizer = AutoTokenizer.from_pretrained(model_name)
bert_model = AutoModelForQuestionAnswering.from_pretrained(model_name).to('cuda')

data = pd.read_json('../Datasets/combined_embeddings.json')
embeddings = np.array(data['embedding'].to_list())
embeddings = torch.tensor(embeddings, dtype=torch.float32).to('cuda')

def find_closest_contexts(query, data, embeddings, k=2):
    query_vector = context_model.encode(query, convert_to_tensor=True).to('cuda')
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

    inputs = tokenizer.encode_plus(input_text, add_special_tokens=True, return_tensors="pt")
    input_ids = inputs["input_ids"].to('cuda')
    attention_mask = inputs["attention_mask"].to('cuda')

    outputs = bert_model(input_ids=input_ids, attention_mask=attention_mask)
    start_scores, end_scores = outputs.start_logits, outputs.end_logits

    start_idx = torch.argmax(start_scores)
    end_idx = torch.argmax(end_scores) + 1 

    answer = tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(input_ids[0][start_idx:end_idx]))

    return answer.strip().capitalize()

if __name__ == "__main__":
    # question = "Who is Virat Kohli?"
    question = sys.argv[1]
    chat_history_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
    chat_history = json.loads(chat_history_json)
    answer = answer_question(question, data, chat_history)
    # print("Answer:", answer)
    print(answer)
