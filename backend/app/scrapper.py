import requests

def scrape_google_jobs(query="software engineer"):
    url = f"https://www.google.com/about/careers/applications/jobs/recommendations"

    response = requests.get(url)
    data = response.json()

    jobs = []

    for job in data.get("jobs", []):
        jobs.append({
            "title": job.get("title"),
            "location": ", ".join(job.get("locations", [])),
            "description": job.get("description", ""),
            "apply_link": job.get("applyUrl", ""),
        })

    return jobs
