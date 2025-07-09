import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyMuPDFLoader  

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")


def load_and_chunk(path):
    loader = PyMuPDFLoader(file_path=path)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=20)
    return splitter.split_documents(documents)


def pipeline(user_path, question):
    spec_path = "backend/Car-specifications-explanation.pdf"
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    all_docs = load_and_chunk(user_path) + load_and_chunk(spec_path)
    db = FAISS.from_documents(all_docs, embeddings)
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 20})
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.4)
    prompt_template = """You are Wagon Bot, a helpful assistant that answers user questions using only the content below:

{context}

This content is extracted from:
- A specifications explainer PDF (system)
- A user-provided PDF

Guidelines:
- Respond using ONLY the content from the PDFs.
- If the answer is not available, reply:
  "Sorry, I don't know the answer to that based on the documents."
- Do not guess or add information beyond the documents.

Question: {question}

Answer:"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    retrieval_qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )

    result = retrieval_qa.invoke({"query": question})  
    return result["result"]


# Example usage
if __name__ == "__main__":
    user_path = r"C:/Users/aditi/Downloads/LB744_REVUELTO_DIGITAL_BROCHURE_01.pdf"
    question = "Tell the specification of the Lamborghini?"
    print(pipeline(user_path, question))