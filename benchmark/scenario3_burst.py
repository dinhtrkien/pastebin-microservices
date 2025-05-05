from locust import HttpUser, task, between, LoadTestShape
import random, string, os

HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"
SLUGS = [l.strip() for l in open("slugs.txt")] if os.path.isfile("slugs.txt") else ["g8RB3Nm4"]

def rand_body():
    import random, string
    return "".join(random.choices(string.ascii_letters + string.digits + " ",
                                  k=random.randint(500, 5000)))

class BurstUser(HttpUser):
    host = HOST
    wait_time = between(0.5, 2)

    @task(10)                    # 909 : 91  ≈  10 : 1
    def read(self):
        slug = random.choice(SLUGS)
        self.client.get(f"/api/pastes/{slug}", name="GET /pastes/:slug")

    @task(1)
    def write(self):
        self.client.post("/api/pastes",
                         json={"content": rand_body(),
                               "expirationType": "never"},
                         name="POST /pastes")

class BurstShape(LoadTestShape):
    """
    10-min run, baseline 333 users.
    Every 2 min spike to 1000 users for 1 min.
    """
    def tick(self):
        elapsed = self.get_run_time()
        if elapsed >= 600:           # stop after 10 min
            return None
        cycle = elapsed % 120        # 0-119 s
        if 60 <= cycle < 120:        # second minute = spike
            return (1000, 200)
        return (333, 100)
