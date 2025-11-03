# Postulate Webservice

This is a modular FastAPI application with a PSQL database connection and a simple AI agent.

## Setup

1.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure environment variables:**

    Create a `.env` file in the root of the project and add the following variables:

    ```
    DATABASE_URL=postgresql://user:password@host:port/database
    GOOGLE_API_KEY=your_google_api_key
    ```

    Replace the placeholder values with your actual database credentials and Google API key.

3.  **Run the application:**

    ```bash
    uvicorn app.main:app --reload
    
    ```

## API Endpoints

*   `POST /items/`: Create a new item.
*   `GET /items/`: Get a list of items.
*   `GET /items/{item_id}`: Get a specific item by ID.
*   `POST /agent/`: Interact with the AI agent.
