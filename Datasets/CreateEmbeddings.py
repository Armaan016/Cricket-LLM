import json
import spacy
from sentence_transformers import SentenceTransformer

nlp = spacy.load("en_core_web_sm")

model = SentenceTransformer("all-MiniLM-L6-v2").to('cuda')

with open(r'C:\Users\raufu\Desktop\Cricket LLM\cricket\Datasets\combined_questions_final.json', 'r') as f:
    data = json.load(f)

num_sentence_chunk_size = 3
embeddings = []

for item in data:
    context = item['context']
    doc = nlp(context)
    sentences = [sent.text.strip() for sent in doc.sents]

    sentence_chunks = [sentences[i:i + num_sentence_chunk_size] for i in range(0, len(sentences), num_sentence_chunk_size)]

    context_embedding = model.encode(context) 
    chunk_text = ' '.join(sentence_chunks)  

    embeddings.append({
        "context_chunk": context,
        "context_embedding": context_embedding.tolist(),
    })

with open('embeddings.json', 'w') as f:
    json.dump(embeddings, f, indent=4)
