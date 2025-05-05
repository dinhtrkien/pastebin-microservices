from locust import HttpUser, task, between, LoadTestShape
import random, string, os

PASTE_HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"

def slugs():
    if os.path.isfile("slugs.txt"):
        return [s.strip() for s in open("slugs.txt") if s.strip()]
    return ["g8RB3Nm4"]
SLUGS = slugs()

def rand_content():
    import random, string
    return "".join(random.choices(string.ascii_letters + string.digits + " ",
                                  k=random.randint(500, 5000)))

class PasteUser(HttpUser):
    host = PASTE_HOST
    wait_time = between(0.5, 2)

    @task(10)                    # 10 : 1  ==  455 : 45
    def read(self):
        slug = random.choice(SLUGS)
        self.client.get(f"/api/pastes/{slug}", name="GET /pastes/:slug")

    @task(1)
    def write(self):
        self.client.post("/api/pastes",
                         json={"content": rand_content(),
                               "expirationType": "never"},
                         name="POST /pastes")

class SteadyShape(LoadTestShape):
    """500 VUs flat for 15 minutes."""
    def tick(self):
        return (500, 20) if self.get_run_time() < 900 else None
