# Candidate manual acceptance record

## Final candidate confirmation - 27 October 2026

The candidate reports completing manual testing, including mobile use and the remaining application checks, and requested final submission preparation on that basis. This supersedes the earlier mobile deferral below. The statement records the candidate's confirmation; detailed device/browser/version logs for those additional checks were not supplied. Automated desktop/mobile evidence is recorded independently in M7-VERIFICATION.md and M8A-VERIFICATION.md.

The candidate also correctly answered the later checkpoint that Tasks filters and sorting survive refresh because they are restored from URL query parameters. Earlier notes below preserve the guided checks and their chronology.

## Guided check history

27 October 2026, candidate-reported checks performed through the live application. These confirmations are distinct from the agent's automated/deployed verification.

The candidate answered OK to the guided steps for login page/Admin login, project creation/reload/edit/required-field validation, task creation/reload/edit/validation, nonempty project deletion protection, search including no results, status/priority/project/assignee/combined filters, overdue display/notice/read persistence/deduplication, completed-task overdue removal, project progress and dashboard count transitions. The candidate also confirmed opening registration and registering a separate Member.

At Member login, the candidate reported invalid credentials, so role-specific manual testing paused. The candidate requested recovery functionality and subsequently chose an Admin-only Member reset feature. Do not mark the Member login/permission rehearsal complete from registration alone. Resume guided testing after approved feature publication and a successful reset/login.

Subsequent confirmations after M7 publication: the candidate selected the real test Member in Member access, completed reset, logged in with the replacement password and later confirmed rejection of the previous password plus successful replacement-password login. They confirmed shared project/task visibility, absent Member management controls, assigned-status persistence, rejection of status editing on an Admin-assigned task, Member-only overdue notices and Admin visibility of both recipients' overdue tasks, and notice removal after rescheduling. They confirmed Member redirect from /members, logout and protected-page redirect.

Further checks: project-filtered ascending title sorting and filter/sort persistence were reported OK. Descending sorting was also reported OK, but the current code has no Title Z-A dropdown option; the agent's earlier instruction was incorrect, so that UI behavior remains unverified pending an explicit fix/retest. The candidate confirmed task deletion after refresh, rejection of an 1899 deadline and empty-project deletion after refresh. On explicit request, the agent created ten fictional pagination tasks in the existing manual test project to reach eleven; the API verified page sizes 10/1. The candidate then confirmed Page 1 of 2, Next, second-page refresh persistence, Previous and search returning Page 1 of 1. Those manual test tasks remain available and are not described as cleaned-up smoke fixtures.

Hands-on mobile testing was deferred by the candidate; desktop/mobile automated workflows remain separate evidence. The earlier pause is historical, not the current manual-test status.

Six earlier multiple-choice checkpoints about server authorization, CSRF, date semantics, request flow, foreign-key constraints and adding a persisted field were answered correctly. These demonstrate those selected concepts, not completion of an entire technical interview or hands-on code change.
