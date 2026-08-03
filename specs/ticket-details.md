
## USER STORY
As a support agent I want to open single ticket, read it's full details, so that I can understand the request without asking the customer to repeat themselves.

## ACCEPTANCE CRITERIA
1. GET /api/tickets:id returns exactly one ticket as JSON
2. A matching id returns a 200 status with teh ticket object - whihc includes all fields
3. A non-mtching id returns a 404 staus woth body { "error": { "code": "NOT_FOUND", "message": "Ticket <id> not found" } }
4. Clicking on the ticket in the list opens a detail view (subject, status, priority, requester, description)
5. The details view has a way back to the list. State only, no router, no reload.

## OUT OF SCOPE (for today)
- Editing, closing or deleting a ticket (read-only)
- A per-ticket URL route, or any router library
- Pagination, filtering.
- Databases
- Auth.

## API CONTRACT
GET /api/tickets/:id
    - 200: the ticket object, every field 
    - 404: { "error": { "code": "NOT_FOUND", "message": "Ticket <id> not found" } } as JSON, never an HTML page, never a 200 with an empty body.