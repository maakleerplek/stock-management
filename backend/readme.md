## to run:
### initialize venv(optional)
python -m venv venv
venv\Scripts\activate

### install libraries
pip install fastapi uvicorn python-dotenv inventree
### run
uvicorn main:app --reload