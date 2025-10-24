# Task Buddy Voice 🎤✨

Setup

TaskBuddy Voice → Tasks
Brief: Voice note → transcription → structured tasks with due dates, and a weekly digest email.
Features: record audio, transcribe, parse tasks (“tomorrow 10am”), store, list, mark done.

Requirements:

Use Claude Code to generate the first parser, then iterate to improve date handling.

Add “confidence + editable parse” UI (user can correct the extracted task).

Implement weekly digest (cron/edge function) with last 7 days summary.
Why: Shows iterative prompt+code cycles, error handling, and UX polish.

AI tolls used: Cursor, Lovable
Database: Supabase
Programming languages used: TypeScript, HTML, JS, SQL, CSS

Architecture:
<img width="1318" height="516" alt="image" src="https://github.com/user-attachments/assets/185945d3-30bc-4d31-b9e6-c537490bdec3" />

Tradeoffs:

Text of the task may be a little bit messy (starting with a come ar a dot and a space) but in return parser works a bit faster, and you can change the text to your liking during the editing process.

How AI tools were used:

First I used Lovable to create the auth page and the main page's frontend, conected first supabase db to register users.

Then I downloaded it and loaded in the cursor to develop backend and fix frontednd a bit and because my credits on lovable ran out. First thing I did was iproving the design to make it more appealing to the user. Next I generated the first parser using cursor. Then I asked it to create task storage, and changed to a new upabase db, that I have access to change without using lovable. After doing it Cursor created weekly digest for me, and with it the work was done, then I used Cursor to add some tests.

What I'd do next

1) Add a separation buy date with some lables, so it is a bit more structured;
2) Remove the edit on the input competely, as it is not that practical, but shift it to being optional, after you create a task;
3) Add level system - the more task you do the bigger the level, it is a good marketing move, to my mind;
