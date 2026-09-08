"""
Gom toàn bộ screens/*.html thành js/templates.js để prototype chạy được khi mở
trực tiếp bằng file:// (double-click index.html, không cần serve.py).

Chạy:  python build.py

Vì sao cần: TPL.load() nạp markup bằng fetch('./screens/…'), mà fetch bị trình
duyệt chặn trên giao thức file://. Bundle này đặt sẵn markup vào TPL.bundle nên
không phải fetch nữa.

Khi chạy qua serve.py, TPL vẫn ưu tiên fetch để sửa file là thấy ngay, không cần
build lại. Chỉ chạy lại build.py trước khi gửi thư mục cho người khác.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "screens")
OUT = os.path.join(ROOT, "js", "templates.js")

HEADER = """/**
 * SINH TỰ ĐỘNG bởi build.py — KHÔNG sửa tay.
 * Nguồn: screens/*.html · Chạy lại: python build.py
 *
 * Cho phép mở index.html trực tiếp từ ổ đĩa (file://) mà không cần máy chủ web.
 */
TPL.bundle = """


def collect():
    """Trả về {tên-không-đuôi: nội dung} cho mọi .html trong screens/, kể cả thư mục con."""
    items = {}
    for dirpath, _dirnames, filenames in os.walk(SRC):
        for fn in sorted(filenames):
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, SRC).replace(os.sep, "/")
            with open(full, encoding="utf-8") as f:
                items[rel[: -len(".html")]] = f.read()
    return dict(sorted(items.items()))


def main():
    if not os.path.isdir(SRC):
        sys.exit("Khong tim thay thu muc screens/ canh build.py")

    items = collect()
    if not items:
        sys.exit("Thu muc screens/ khong co file .html nao")

    body = ",\n".join(
        "  %s: %s" % (json.dumps(name), json.dumps(src, ensure_ascii=False))
        for name, src in items.items()
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(HEADER + "{\n" + body + "\n};\n")

    size = os.path.getsize(OUT)
    print("js/templates.js: %d template, %.1f KB" % (len(items), size / 1024))

    # Goi tat theo ten file (TPL.resolve) chi chay khi ten file khong trung giua cac thu muc.
    seen = {}
    for name in items:
        base = name.rsplit("/", 1)[-1]
        if base in seen:
            print("Canh bao: trung ten '%s' -> %s | %s" % (base, seen[base], name))
        seen[base] = name

    # Doi chieu voi TPL.manifest de phat hien file quen dang ky.
    tpl_path = os.path.join(ROOT, "js", "tpl.js")
    if os.path.exists(tpl_path):
        with open(tpl_path, encoding="utf-8") as f:
            tpl_src = f.read()
        missing = [n for n in items if "'%s'" % n not in tpl_src]
        if missing:
            print("Canh bao: chua co trong TPL.manifest -> %s" % ", ".join(missing))
            print("  Chay: node docs/sync-manifest.js")


if __name__ == "__main__":
    main()
