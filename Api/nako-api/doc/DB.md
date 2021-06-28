# Nako Backend Databse Documentation
## Description
- A sqlite db
## Tables
 - login
 - register

### Table:login
| fields        | type           | notes  |
| ------------- |:-------------:| -----:|
| user      | TEXT |   password |
| type | INTEGER      |    0 or 1 or 2|
- student : 0 , teacher : 1 , technician :2

### Table:register
| fields        | type           | notes  |
| ------------- |:-------------:| -----:|
| pin      | INTEGER | username |
| is_used     | INTEGER |   0 or 1 |