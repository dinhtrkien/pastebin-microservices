import random
import string
from locust import HttpUser, task, between

class PastebinUser(HttpUser):
    """
    User class that does requests to the pastebin API
    """
    # Wait between 1 and 3 seconds between tasks
    wait_time = between(1, 3)
    host = "http://localhost:3000"
    created_slugs = [] # Store slugs of created pastes

    @task(1)
    def create_paste(self):
        """
        Task to create a new paste
        """
        # Generate random content for the paste
        paste_content = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation + ' ', k=random.randint(50, 100)))
        # Optionally choose an expiration type
        expiration_types = ["10m", "1h", "1d", "never"]
        expiration_type = random.choice(expiration_types)

        payload = {
            "content": paste_content
        }
        if expiration_type:
            payload["expirationType"] = expiration_type

        headers = {'Content-Type': 'application/json'}

        # Capture the response to extract the slug
        with self.client.post("/api/pastes", json=payload, headers=headers, name="Create Paste", catch_response=True) as response:
            if response.status_code == 201:  # Assuming 201 Created on success
                try:
                    # Extract slug from response
                    paste_data = response.json()
                    if 'slug' in paste_data:
                        self.created_slugs.append(paste_data['slug'])
                except Exception as e:
                    response.failure(f"Failed to parse response: {e}")
    
    @task(3)
    def get_paste(self):
        """
        Task to get an existing paste by its slug
        """
        # Only attempt to get a paste if we have created at least one
        if self.created_slugs:
            slug_to_get = random.choice(self.created_slugs)
            self.client.get(f"/api/pastes/{slug_to_get}", name="Get Paste")
        # If no pastes have been created yet, this task does nothing