import sys
import json
import torch
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, pipeline

model = SentenceTransformer("all-MiniLM-L6-v2").to('cuda')

data = pd.read_json(r'C:\\Users\\raufu\\Desktop\\Cricket LLM\\cricket\\Datasets\\combined_embeddings.json')
embeddings = np.array(data['embedding'].to_list())
embeddings = torch.tensor(embeddings, dtype=torch.float32).to('cuda')

tokenizer = AutoTokenizer.from_pretrained("deepset/roberta-base-squad2")
qa_model = AutoModelForQuestionAnswering.from_pretrained("deepset/roberta-base-squad2").to('cuda')
qa_pipeline = pipeline("question-answering", model=qa_model, tokenizer=tokenizer, device=0)

def find_closest_contexts(query, data, embeddings, k=3):
    query_vector = torch.tensor(model.encode(query)).to('cuda')
    dot_scores = util.dot_score(query_vector, embeddings)
    top_contexts = torch.topk(dot_scores, k=k)
    relevant = data.iloc[top_contexts.indices.tolist()[0]]['chunk'].tolist()
    return relevant

def format_history(history):
    formatted_history = ""
    for item in history:
        formatted_history += f"Question: {item['question']}\nAnswer: {item['answer']}\n\n"
    return formatted_history

def answer_question(question, data, chat_history):
    formatted_history = format_history(chat_history)
    top_contexts = find_closest_contexts(question, data, embeddings)
    full_context = formatted_history + "\n".join(top_contexts)

    # print(f"Context: {full_context}\n\n")
    result = qa_pipeline(question=question, context=full_context)
    return result['answer'].capitalize()

if __name__ == "__main__":
    question = sys.argv[1]
    # question = "Who is Virat Kohli"
    chat_history_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
    chat_history = json.loads(chat_history_json)
    answer = answer_question(question, data, chat_history)
    print("Answer:", answer)
