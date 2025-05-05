from locust import HttpUser, task, between, LoadTestShape
import random, string, os

PASTE_HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"

def load_slugs():
    if os.path.isfile("slugs.txt"):
        with open("slugs.txt") as f:
            return [s.strip() for s in f if s.strip()]
    return ["g8RB3Nm4"]           # fallback demo slug

SLUGS = load_slugs()

def random_content():
    length = random.randint(500, 5000)
    chars = string.ascii_letters + string.digits + " "
    return "".join(random.choices(chars, k=length))

class PasteUser(HttpUser):
    host = PASTE_HOST
    wait_time = between(0.5, 2)

    @task(9)
    def read_paste(self):
        slug = random.choice(SLUGS)
        self.client.get(f"/api/pastes/{slug}", name="GET /pastes/:slug")

    @task(1)
    def create_paste(self):
        self.client.post(
            "/api/pastes",
            json={"content": random_content(), "expirationType": "never"},
            name="POST /pastes"
        )

class SmokeShape(LoadTestShape):
    """50 VUs flat for 5 minutes."""
    def tick(self):
        t = self.get_run_time()
        return (50, 5) if t < 300 else None
