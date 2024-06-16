import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, pipeline

model = SentenceTransformer("all-MiniLM-L6-v2")

with open(r'C:\Users\raufu\Desktop\Cricket LLM\cricket\Datasets\embeddings4.json', 'r') as f:
    embeddings = json.load(f)

tokenizer = AutoTokenizer.from_pretrained("bert-large-uncased-whole-word-masking-finetuned-squad")
qa_model = AutoModelForQuestionAnswering.from_pretrained("bert-large-uncased-whole-word-masking-finetuned-squad")
qa_pipeline = pipeline("question-answering", model=qa_model, tokenizer=tokenizer)

def find_closest_contexts(query, embeddings, top_k=3):
    query_vector = model.encode(query).reshape(1, -1)
    
    similarities = []
    for item in embeddings:
        chunk_vector = np.array(item['context_embedding']).reshape(1, -1)
        similarity = cosine_similarity(query_vector, chunk_vector)[0][0]
        similarities.append((similarity, item['context_chunk']))
    
    similarities.sort(key=lambda x: x[0], reverse=True)
    top_contexts = [context for _, context in similarities[:top_k]]
    # print(top_contexts)

    return top_contexts

def answer_question(question, embeddings, top_k=3):
    top_contexts = find_closest_contexts(question, embeddings, top_k)
    combined_context = ' '.join(top_contexts)

    result = qa_pipeline(question=question, context=combined_context)
    return result['answer'].capitalize()

# user_query = "Who was the most successful Indian test captain?"
user_query = sys.argv[1]
answer = answer_question(user_query, embeddings, top_k=3)

# print(f'Answer: {answer}')
print(answer)