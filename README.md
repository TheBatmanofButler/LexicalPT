Digital filing system specialized for physical therapists

Client, backend, database -> html/jquery, node, dynamodb

Dynamo contains three relevent tables: JAGClientData, JAGUsers, JAGClientArchiveData.

JAGUsers table contains login info, with username and hashed password stored for tokens. Login is similar to oauth process.

JAGClientData stores all data related to a login. The data contains a different info block for each element of the form that is written in. 

ArchiveData contains forms that were archived.

================================================

Frontend is based on central patient form listing area. Each patient has a global portion of the form and a daily portion of the form. 

Global form elements are those that persist through a single injury; 
daily elements are those that are relevent for a certain visit. 

Form retrieval is done by name of person and date, which are both ensured unique on submission.

Form tools are used to manipulate the form beyond text input.