"""
Sắp xếp lại screens/ theo vai — chạy MỘT LẦN:  python docs/reorganize.py

    screens/a-*.html   → screens/buyer/
    screens/c-*.html   → screens/seller/
    screens/d-*.html   → screens/admin/
    screens/partials/  → giữ nguyên
    còn lại            → screens/common/   (home, policy, 403, demo-nav, shell-*)

Tên file GIỮ NGUYÊN mã theo CHANGE-SPEC-v3 (a-01, d-03…) để còn tra ngược về spec.
Không phải sửa js/views-*.js: TPL.resolve() cho phép gọi tắt 'a-01' khi file nằm ở
screens/buyer/a-01.html (xem js/tpl.js).

Script tự cập nhật TPL.manifest trong js/tpl.js, chạy lại nhiều lần vô hại, và ưu tiên
`git mv` để giữ lịch sử file. Muốn quay lại: git checkout . && git clean -fd
"""
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENS = os.path.join(ROOT, "screens")
TPL_JS = os.path.join(ROOT, "js", "tpl.js")

FOLDERS = ("buyer", "seller", "admin", "common", "partials")


def target_folder(filename):
    """Thư mục đích cho một file .html nằm ngay trong screens/."""
    if filename.startswith("a-"):
        return "buyer"
    if filename.startswith("c-"):
        return "seller"
    if filename.startswith("d-"):
        return "admin"
    return "common"


def git_ok():
    if not os.path.isdir(os.path.join(ROOT, ".git")):
        return False
    try:
        subprocess.run(["git", "--version"], cwd=ROOT, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (OSError, subprocess.CalledProcessError):
        return False


def move(src, dst, use_git):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if use_git:
        r = subprocess.run(["git", "mv", os.path.relpath(src, ROOT), os.path.relpath(dst, ROOT)],
                           cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if r.returncode == 0:
            return
    shutil.move(src, dst)


def all_names():
    """Mọi template hiện có: đường dẫn tương đối screens/, bỏ đuôi .html, dùng dấu /."""
    out = []
    for dirpath, _dirs, files in os.walk(SCREENS):
        for fn in files:
            if fn.endswith(".html"):
                rel = os.path.relpath(os.path.join(dirpath, fn), SCREENS)
                out.append(rel.replace(os.sep, "/")[: -len(".html")])
    return sorted(out)


def check_collisions(names):
    """Gọi tắt theo tên file chỉ chạy khi tên file không trùng giữa các thư mục."""
    seen = {}
    dup = []
    for n in names:
        base = n.rsplit("/", 1)[-1]
        if base in seen:
            dup.append((base, seen[base], n))
        seen[base] = n
    return dup


def write_manifest(names):
    """Ghi lại TPL.manifest trong js/tpl.js, nhóm theo thư mục cho dễ đọc."""
    groups = {}
    for n in names:
        groups.setdefault(n.split("/")[0] if "/" in n else "misc", []).append(n)
    body = ",\n".join(
        "    " + ", ".join("'%s'" % n for n in groups[k]) for k in sorted(groups)
    )
    with open(TPL_JS, encoding="utf-8") as f:
        src = f.read()
    import re
    new, count = re.subn(r"manifest: \[[\s\S]*?\n  \],",
                         "manifest: [\n" + body + "\n  ],", src, count=1)
    if not count:
        sys.exit("Khong tim thay TPL.manifest trong js/tpl.js — dung lai, chua ghi gi.")
    with open(TPL_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write(new)


def main():
    if not os.path.isdir(SCREENS):
        sys.exit("Khong tim thay thu muc screens/")

    loose = sorted(f for f in os.listdir(SCREENS)
                   if f.endswith(".html") and os.path.isfile(os.path.join(SCREENS, f)))
    use_git = git_ok()

    if loose:
        moved = {}
        for fn in loose:
            folder = target_folder(fn)
            move(os.path.join(SCREENS, fn), os.path.join(SCREENS, folder, fn), use_git)
            moved.setdefault(folder, []).append(fn)
        for folder in sorted(moved):
            print("%-9s %d file" % (folder + "/", len(moved[folder])))
        print("Da di chuyen %d file%s." % (len(loose), " (git mv)" if use_git else ""))
    else:
        print("Khong con file .html roi trong screens/ — bo qua buoc di chuyen.")

    names = all_names()
    dup = check_collisions(names)
    if dup:
        print("\nCANH BAO: trung ten file giua cac thu muc, goi tat se bao loi:")
        for base, a, b in dup:
            print("  %s  ->  %s  |  %s" % (base, a, b))

    write_manifest(names)
    print("\njs/tpl.js: manifest cap nhat, %d template." % len(names))
    print("Buoc tiep theo:")
    print("  python build.py                  # sinh lai js/templates.js")
    print("  node docs/check-templates.js     # bien dich thu toan bo (neu co node)")


if __name__ == "__main__":
    main()
