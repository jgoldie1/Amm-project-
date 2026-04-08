Verified Merge Workflow

1. Keep master app locked in master_lock/master_app_locked.py
2. Copy locked master into app.py before each new merge
3. Merge one feature block only
4. Run:
   python -m py_compile app.py
5. Start server and test route
6. If good, save result as a new verified merge file
7. If bad, restore locked master
