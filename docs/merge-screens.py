"""
Gộp các mảnh markup của cùng một màn hình vào một file — chạy MỘT LẦN:

    python docs/merge-screens.py

    screens/admin/d-02.html          ← d-02 + d-02-table + d-02-drawer + d-02-modal-*
    screens/buyer/a-03.html          ← 8 file a-03-*
    screens/common/common.html       ← home, policy, 403, demo-nav, shell-buyer/seller/admin
    screens/common/partials.html     ← 22 file partials/*

Các mảnh con được bọc trong {% block tên %} … {% endblock %}, TPL tách lại lúc nạp nên
TPL.render('d-02-table') vẫn chạy như cũ — KHÔNG phải sửa dòng nào trong js/views-*.js.

Tên khối giữ nguyên tên template cũ (kể cả tiền tố 'partials/'), vì vậy việc gộp là
thuần túy dồn file, không đổi hành vi. Script chạy lại nhiều lần vô hại.

Hoàn tác: git checkout . && git clean -fd
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENS = os.path.join(ROOT, "screens")
TPL_JS = os.path.join(ROOT, "js", "tpl.js")

ROUTE_RE = re.compile(r"^([acd]-\d+)(?:-|$)")


def git_ok():
    if not os.path.isdir(os.path.join(ROOT, ".git")):
        return False
    try:
        subprocess.run(["git", "--version"], cwd=ROOT, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (OSError, subprocess.CalledProcessError):
        return False


def remove(path, use_git):
    rel = os.path.relpath(path, ROOT)
    if use_git:
        r = subprocess.run(["git", "rm", "-q", "--", rel], cwd=ROOT,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if r.returncode == 0:
            return
    os.remove(path)


def plan():
    """Trả về {file đích tương đối: [(tên template, đường dẫn nguồn), …]}, mục đầu là template chính."""
    groups = {}
    for folder in sorted(os.listdir(SCREENS)):
        d = os.path.join(SCREENS, folder)
        if not os.path.isdir(d):
            continue
        files = sorted(f for f in os.listdir(d) if f.endswith(".html"))
        for fn in files:
            stem = fn[: -len(".html")]
            src = os.path.join(d, fn)
            if folder == "partials":
                groups.setdefault("common/partials.html", []).append(("partials/" + stem, src))
            elif folder == "common":
                if stem in ("common", "partials"):
                    continue
                groups.setdefault("common/common.html", []).append((stem, src))
            else:
                m = ROUTE_RE.match(stem)
                key = "%s/%s.html" % (folder, m.group(1)) if m else "%s/%s.html" % (folder, stem)
                groups.setdefault(key, []).append((stem, src))

    # Sắp thứ tự: template chính (tên trùng tên file đích) lên đầu, còn lại theo alphabet.
    out = {}
    for target, items in groups.items():
        main_name = os.path.basename(target)[: -len(".html")]
        items.sort(key=lambda it: (it[0] != main_name, it[0]))
        out[target] = items
    return out


def build(target, items):
    """Nội dung file gộp: template chính để trần, các mảnh còn lại bọc trong {% block %}."""
    main_name = os.path.basename(target)[: -len(".html")]
    parts = []
    for name, src in items:
        with open(src, encoding="utf-8") as f:
            body = f.read()
        if "{% block" in body or "{% endblock" in body:
            sys.exit("File %s da chua {%% block %%} — co ve da gop roi, dung lai." % src)
        if name == main_name:
            parts.append(body.rstrip("\n") + "\n")
        else:
            parts.append("{%% block %s %%}\n%s{%% endblock %%}\n" % (name, body if body.endswith("\n") else body + "\n"))
    return "\n".join(parts)


def write_manifest():
    names = []
    for dirpath, _dirs, files in os.walk(SCREENS):
        for fn in files:
            if fn.endswith(".html"):
                rel = os.path.relpath(os.path.join(dirpath, fn), SCREENS)
                names.append(rel.replace(os.sep, "/")[: -len(".html")])
    names.sort()
    groups = {}
    for n in names:
        groups.setdefault(n.split("/")[0] if "/" in n else "misc", []).append(n)
    body = ",\n".join("    " + ", ".join("'%s'" % n for n in groups[k]) for k in sorted(groups))
    with open(TPL_JS, encoding="utf-8") as f:
        src = f.read()
    new, count = re.subn(r"manifest: \[[\s\S]*?\n  \],", "manifest: [\n" + body + "\n  ],", src, count=1)
    if not count:
        sys.exit("Khong tim thay TPL.manifest trong js/tpl.js.")
    with open(TPL_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write(new)
    return len(names)


def main():
    if not os.path.isdir(SCREENS):
        sys.exit("Khong tim thay thu muc screens/ — chay docs/reorganize.py truoc.")

    groups = plan()
    todo = {t: items for t, items in groups.items() if len(items) > 1 or os.path.basename(t)[:-5] not in [i[0] for i in items]}
    if not todo:
        print("Khong co gi de gop — moi man hinh da nam gon trong mot file.")
        write_manifest()
        return

    use_git = git_ok()
    merged = removed = 0
    for target in sorted(todo):
        items = todo[target]
        dst = os.path.join(SCREENS, *target.split("/"))
        content = build(target, items)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        for name, src in items:
            if os.path.abspath(src) != os.path.abspath(dst):
                remove(src, use_git)
                removed += 1
        merged += 1
        print("%-28s %d template" % (target, len(items)))

    total = write_manifest()
    print("\nGop %d file dich, xoa %d file nguon. Con lai %d file .html trong screens/." % (merged, removed, total))
    print("Buoc tiep theo:")
    print("  node docs/check-templates.js     # bien dich thu + doi chieu ten khoi")
    print("  python build.py                  # sinh lai js/templates.js")


if __name__ == "__main__":
    main()
