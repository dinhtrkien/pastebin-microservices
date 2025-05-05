import random
import string
from locust import HttpUser, task, between

class PastebinUser(HttpUser):
    """
    User class that does requests to the pastebin API
    """
    # Wait between 1 and 3 seconds between tasks
    # wait_time = between(1, 3)
    host = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000" # Assuming paste-service runs on port 3000
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
        expiration_types = ["never"]
        expiration_type = random.choice(expiration_types)

        payload = {
            "content": paste_content
        }
        if expiration_type:
            payload["expirationType"] = expiration_type

        headers = {'Content-Type': 'application/json'}

        response = self.client.post("/api/pastes", json=payload, headers=headers, name="Create Paste")
        
        # Extract and store the slug if request was successful
        if response.status_code == 200 or response.status_code == 201:
            try:
                slug = response.json().get("slug")
                if slug:
                    self.created_slugs.append(slug)
                    print(f"Created paste with slug: {slug}")
                    
                    # Save the slug to a file
                    with open("slugs.txt", "a") as f:
                        f.write(f"{slug}\n")
                        
            except Exception as e:
                print(f"Error extracting slug: {e}")
    
    # @task(10) # Give get_paste lower weight
    # def get_paste(self):
    #     """
    #     Task to get an existing paste by its slug
    #     """
    #     if not self.created_slugs:
    #         # No slugs created yet, skip this task run
    #         return

    #     slug_to_get = random.choice(self.created_slugs)
    #     self.client.get(f"/api/pastes/{slug_to_get}", name="Get Paste")

    # @task()
    # def getSlug(self):
    #     self.client.get(f"/slug", name="Get Slug")