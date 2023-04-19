START ON MAIN BRANCH

1. git pull
2. git checkout -b "feature/\_\_\_\_"

MAKE CHANGES ON FEATURE BRANCH

3. git stash
4. git checkout main
5. git pull
6. git checkout "feature/\_\_\_\_"
7. git merge main
8. git stash pop

ADD / COMMIT / PUSH

9. create pull request on GitHub
10. request to merge