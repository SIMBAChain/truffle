# Setting up auth for Azure AD

If your SIMBA Enterprise Platform is deployed using Azure AD authentication, you will need to create and AD App Registration to authenticate.

Once created, add a platfrom (Manage -> Authentication in the Azure portal), and choose "Mobile and desktop applications".
Set the Redirect URI to "http://localhost:22315/auth-callback".

Under "Implicit grant" on the same page, select Access tokens and ID Tokens.

Under "Advanced settings", ensure "Allow public client flows" is enabled.

Then press save at the top.

Under "Manage -> API permissions", select "Add a permission", then "APIs my organisation uses".
Search for the App Registration used for your SIMBA Enterprise Platform, then choose the "scaas.access" permission. Then hit OK.
Click on the permission on the list, and copy the URL in the panel that opens - this is the scope.

Navigate to the app registrations Overview page. From this page, grab the "Application (client) ID", and "Directory (tenant) ID", along with the scope from above, and add these to your simba.json:

```json
{
  "baseUrl": "https://my-sep.example.com/v2/",
  "authorizeUrl": "https://login.microsoftonline.com/{Directory (tenant) ID}/oauth2/v2.0/authorize",
  "tokenUrl": "https://login.microsoftonline.com/{Directory (tenant) ID}/oauth2/v2.0/token",
  "clientID": "{Application (client) ID}",
  "scope": "openid offline_access {scope}"
}
```
