import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import List, Dict
from urllib.parse import urlparse, parse_qs
import uuid

class UserRequestHandler(BaseHTTPRequestHandler):
    users = [{
        "id": str(uuid.uuid4()),
        "name": "Michal", 
        "surname": "Mucha", 
        "role": "instructor"
    }]

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"users": self.users}).encode())
    
    def _send_response(self, response_data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        received_data = json.loads(post_data.decode())
        
        input_first_name = received_data.get("name")
        input_last_name = received_data.get("surname")
        team_role = received_data.get("role")
    
        if input_first_name and input_last_name:
            new_user = {
                "id": str(uuid.uuid4()),
                "name": input_first_name,
                "surname": input_last_name,
                "role": team_role
            }
            self.users.append(new_user)
            self._send_response({
                "message": "User added successfully",
                "users": self.users
            }, status_code=201)
        else:
            self.send_error(400, "Both name and surname are required")

    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        if 'id' in query_params:
            user_id = query_params['id'][0]
            user_to_delete = next((user for user in self.users if user["id"] == user_id), None)
            if user_to_delete:
                self.users.remove(user_to_delete)
                self._send_response({"message": "User deleted successfully", "users": self.users})
            else:
                self.send_error(404, "User ID not found")
        else:
            self.send_error(400, "User ID parameter missing")
        

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, UserRequestHandler)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
