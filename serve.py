"""
Dev server cho prototype v2 (HOMI365 / Medigo).

Chạy:  python serve.py          (mặc định cổng 5174)
       python serve.py 8080

Gửi Cache-Control: no-store để mỗi lần refresh nạp đúng file vừa sửa.
Phục vụ đúng thư mục chứa file này, bất kể chạy từ đâu.
"""
import os
import sys
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5174
    handler = partial(NoCacheHandler, directory=ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    server.daemon_threads = True
    print(f"HOMI365 prototype v2: http://localhost:{port}/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDa dung server.")


if __name__ == "__main__":
    main()
