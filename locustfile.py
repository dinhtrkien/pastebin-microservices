import random
import string
from locust import HttpUser, task, between

class PastebinUser(HttpUser):
    """
    User class that does requests to the pastebin API
    """
    # Wait between 1 and 3 seconds between tasks
    # wait_time = between(1, 3)
    host = "http://localhost:3000" # Assuming paste-service runs on port 3000
    # host = "http://localhost:3004"

    created_slugs = [] # Store slugs of created pastes

    @task(1)
    def create_paste(self):
        """
        Task to create a new paste
        """
        # Generate random content for the paste
        paste_content = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation + ' ', k=random.randint(500, 5000)))
        # Optionally choose an expiration type
        expiration_types = ["10m", "1h", "1d", "never"]
        expiration_type = random.choice(expiration_types)

        payload = {
            "content": paste_content
        }
        if expiration_type:
            payload["expirationType"] = expiration_type

        headers = {'Content-Type': 'application/json'}

        self.client.post("/api/pastes", json=payload, headers=headers, name="Create Paste")
    
    @task(9) # Give get_paste lower weight
    def get_paste(self):
        """
        Task to get an existing paste by its slug
        """
        if not self.created_slugs:
            # No slugs created yet, skip this task run
            return

        slug_to_get = random.choice(self.created_slugs)
        self.client.get(f"/api/pastes/{slug_to_get}", name="Get Paste")

    # @task()
    # def getSlug(self):
    #     self.client.get(f"/slug", name="Get Slug")
