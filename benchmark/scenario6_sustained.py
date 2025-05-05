from locust import HttpUser, task, between, LoadTestShape
import random, string, os

HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"
SLUGS = [s.strip() for s in open("slugs.txt")] if os.path.isfile("slugs.txt") else ["g8RB3Nm4"]

def lorem():
    import random, string
    return "".join(random.choices(string.ascii_letters + string.digits + " ",
                                  k=random.randint(500, 5000)))

class SustainedUser(HttpUser):
    host = HOST
    wait_time = between(0.5, 2)

    @task(10)                    # 1818 : 182  ≈ 10 : 1
    def read(self):
        self.client.get(f"/api/pastes/{random.choice(SLUGS)}",
                         name="GET /pastes/:slug")

    @task(1)
    def write(self):
        self.client.post("/api/pastes",
                         json={"content": lorem(),
                               "expirationType": "never"},
                         name="POST /pastes")

class SustainedShape(LoadTestShape):
    """2 000 users for 30 minutes."""
    def tick(self):
        return (2000, 100) if self.get_run_time() < 1800 else None
