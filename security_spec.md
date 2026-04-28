# Security Spec for Africa Sound City

## Data Invariants
1. A review can only be created with status 'pending'.
2. Users can only create reviews if they are signed in (can be anonymous).
3. `uid` must match `request.auth.uid`.
4. `createdAt` must be the server timestamp.
5. Only admins can read pending reviews or change the status. Regular users can only read "approved" reviews.

## The "Dirty Dozen" Payloads
1. Create review with status 'approved'. (Reject)
2. Create review with missing `authorName`. (Reject)
3. Create review with missing `uid`. (Reject)
4. Create review with spoofed `uid`. (Reject)
5. Create review with invalid type for `rating`. (Reject)
6. Read a pending review as anonymous user. (Reject)
7. Update a review as author. (Reject - users cannot edit reviews)
8. Send payload with extra fields (Ghost field). (Reject)
9. Send `createdAt` as string from client. (Reject)
10. Send a 2MB string for `authorName`. (Reject)
11. Update 'status' to random string. (Reject)
12. Delete review as regular user. (Reject)
