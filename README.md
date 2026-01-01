# generate-plans
automatically generate care plans based on information (clinicals) found within the patient’s record

# teck stack
I chose a Node/TypeScript backend because it allowed me to focus on data integrity, validation, and duplicate detection rather than framework ramp-up. In a production environment, this architecture could be implemented equivalently in Django or another backend framework.
I used MongoDB because it best matched the duplicate-detection + rapid iteration needs and is a database I can implement correctly with strong indexes and constraints. This design would translate directly to Django/Postgres in production; the core integrity rules and API boundaries remain the same.
