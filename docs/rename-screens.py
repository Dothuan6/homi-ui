"""
Đổi mã màn hình (a-01, D-02…) sang tên tiếng Anh dễ đọc — chạy MỘT LẦN:

    python docs/rename-screens.py

Đổi ba thứ, đồng bộ với nhau:
  1. Tên file      screens/buyer/a-01.html      → screens/buyer/buy.html
  2. Tên template  TPL.render('d-02-table')     → TPL.render('admin/agents-table')
                   {% block d-02-table %}       → {% block admin/agents-table %}
  3. Mã route      #A-02, 'D-09'                 → #payment, 'registrations'

KHÔNG đổi tên hàm JS (Buyer.A01, Admin.D02…) vì Admin.login đã tồn tại — đổi sẽ đụng tên.
Đó là việc riêng, làm sau nếu muốn.

An toàn: tên template chỉ được thay khi đứng ngay sau TPL.render( / this.parts( / include(,
nên chuỗi trùng tên dùng cho việc khác (ico: 'home') không bị đổi nhầm.

Hoàn tác: git checkout . && git clean -fd
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENS = os.path.join(ROOT, "screens")
TPL_JS = os.path.join(ROOT, "js", "tpl.js")

# --- Tên template: tên cũ (đang dùng trong JS/markup) → tên mới đầy đủ kèm thư mục ---
TEMPLATES = {
    "a-01": "buyer/buy", "a-01-state": "buyer/buy-state",
    "a-02": "buyer/payment", "a-02-choose": "buyer/payment-choose",
    "a-02-gateway": "buyer/payment-gateway", "a-02-bank": "buyer/payment-bank",
    "a-02-expired": "buyer/payment-expired",
    "a-03-paid": "buyer/order-result-paid", "a-03-nocode": "buyer/order-result-nocode",
    "a-03-later": "buyer/order-result-later", "a-03-failed": "buyer/order-result-failed",
    "a-03-awaiting": "buyer/order-result-awaiting", "a-03-rejected": "buyer/order-result-rejected",
    "a-03-reg-prompt": "buyer/order-result-reg-prompt",
    "a-03-reg-prompt-foot": "buyer/order-result-reg-prompt-foot",
    "a-04": "buyer/order-lookup", "a-04-result": "buyer/order-lookup-result",
    "a-04-card": "buyer/order-lookup-card",
    "a-05": "buyer/login", "a-05-reset": "buyer/login-reset",
    "a-06": "buyer/register", "a-06-check": "buyer/register-check",
    "a-06-blocked": "buyer/register-blocked", "a-06-status": "buyer/register-status",
    "a-06-form": "buyer/register-form", "a-06-done": "buyer/register-done",

    "c-01": "seller/dashboard", "c-01-stats": "seller/dashboard-stats",
    "c-01-stats-body": "seller/dashboard-stats-body", "c-01-cmchart": "seller/dashboard-cmchart",
    "c-01-commissions": "seller/dashboard-commissions",
    "c-01-commissions-table": "seller/dashboard-commissions-table",
    "c-01-tree": "seller/dashboard-tree",
    "c-02": "seller/my-package",
    "c-03": "seller/wallet", "c-03-withdraw": "seller/wallet-withdraw",
    "c-03-requests": "seller/wallet-requests", "c-03-ledger": "seller/wallet-ledger",
    "c-profile": "seller/profile",

    "d-00": "admin/login", "d-00-alert": "admin/login-alert",
    "d-01": "admin/dashboard", "d-01-job-result": "admin/dashboard-job-result",
    "d-02": "admin/agents", "d-02-table": "admin/agents-table", "d-02-drawer": "admin/agents-drawer",
    "d-02-modal-referrer": "admin/agents-modal-referrer", "d-02-modal-rank": "admin/agents-modal-rank",
    "d-02-modal-root": "admin/agents-modal-root",
    "d-03": "admin/orders", "d-03-table": "admin/orders-table",
    "d-03-drawer": "admin/orders-drawer", "d-03-allocation": "admin/orders-allocation",
    "d-04": "admin/products", "d-04-commission-table": "admin/products-commission-table",
    "d-04-modal-table": "admin/products-modal-table", "d-04-modal-package": "admin/products-modal-package",
    "d-05": "admin/inventory", "d-05-table": "admin/inventory-table",
    "d-05-drawer": "admin/inventory-drawer", "d-05-modal-generate": "admin/inventory-modal-generate",
    "d-05-modal-import": "admin/inventory-modal-import",
    "d-06": "admin/ranks",
    "d-07": "admin/withdrawals", "d-07-withdraw": "admin/withdrawals-list",
    "d-07-ledger": "admin/withdrawals-ledger", "d-07-drawer": "admin/withdrawals-drawer",
    "d-08": "admin/exceptions",
    "d-09": "admin/registrations", "d-09-table": "admin/registrations-table",
    "d-09-drawer": "admin/registrations-drawer",
    "d-10": "admin/users", "d-10-form": "admin/users-form",

    "home": "common/home", "policy": "common/policy", "403": "common/403",
    "demo-nav": "common/demo-nav", "shell-buyer": "common/shell-buyer",
    "shell-seller": "common/shell-seller", "shell-admin": "common/shell-admin",
}

# --- Đổi tên file: đường dẫn cũ trong screens/ → đường dẫn mới ---
FILES = {
    "buyer/a-01": "buyer/buy", "buyer/a-02": "buyer/payment", "buyer/a-03": "buyer/order-result",
    "buyer/a-04": "buyer/order-lookup", "buyer/a-05": "buyer/login", "buyer/a-06": "buyer/register",
    "seller/c-01": "seller/dashboard", "seller/c-02": "seller/my-package",
    "seller/c-03": "seller/wallet", "seller/c-profile": "seller/profile",
    "admin/d-00": "admin/login", "admin/d-01": "admin/dashboard", "admin/d-02": "admin/agents",
    "admin/d-03": "admin/orders", "admin/d-04": "admin/products", "admin/d-05": "admin/inventory",
    "admin/d-06": "admin/ranks", "admin/d-07": "admin/withdrawals", "admin/d-08": "admin/exceptions",
    "admin/d-09": "admin/registrations", "admin/d-10": "admin/users",
}

# --- Mã route trên URL: cũ → mới ---
ROUTES = {
    "A-01": "buy", "A-02": "payment", "A-03": "order-result", "A-04": "order-lookup",
    "A-05": "login", "A-06": "register",
    "C-01": "dashboard", "C-02": "my-package", "C-03": "wallet", "C-PROFILE": "profile",
    "D-00": "admin-login", "D-01": "admin-dashboard", "D-02": "agents", "D-03": "orders",
    "D-04": "products", "D-05": "inventory", "D-06": "ranks", "D-07": "withdrawals",
    "D-08": "exceptions", "D-09": "registrations", "D-10": "admin-users",
}
# Route chữ hoa còn lại — thay dè dặt, chỉ khi trong nháy hoặc sau dấu #
WORDY_ROUTES = {"HOME": "home", "POLICY": "policy", "STYLEGUIDE": "styleguide"}

CALL = r"(TPL\.render\(\s*|this\.parts\(\s*|include\(\s*)"


def git_ok():
    if not os.path.isdir(os.path.join(ROOT, ".git")):
        return False
    try:
        subprocess.run(["git", "--version"], cwd=ROOT, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (OSError, subprocess.CalledProcessError):
        return False


def rename_files(use_git):
    done = 0
    for old, new in sorted(FILES.items()):
        src = os.path.join(SCREENS, *(old + ".html").split("/"))
        dst = os.path.join(SCREENS, *(new + ".html").split("/"))
        if not os.path.exists(src):
            continue
        if os.path.exists(dst):
            sys.exit("Da ton tai %s — dung lai de khong ghi de." % new)
        if use_git:
            r = subprocess.run(["git", "mv", os.path.relpath(src, ROOT), os.path.relpath(dst, ROOT)],
                               cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if r.returncode != 0:
                os.rename(src, dst)
        else:
            os.rename(src, dst)
        done += 1
    return done


def rewrite(text):
    """Thay tên template (chỉ trong lời gọi và {% block %}) rồi thay mã route."""
    n = 0
    # Ghép chuỗi thay vì dùng %-format: mẫu {% block %} có ký tự '%' nên %-format sẽ nổ ValueError.
    for old, new in sorted(TEMPLATES.items(), key=lambda kv: -len(kv[0])):
        esc, rep = re.escape(old), new
        text, c1 = re.subn(CALL + "'" + esc + "'", lambda m, r=rep: m.group(1) + "'" + r + "'", text)
        text, c2 = re.subn(CALL + '"' + esc + '"', lambda m, r=rep: m.group(1) + '"' + r + '"', text)
        text, c3 = re.subn(r"(\{%\s*block\s+)" + esc + r"(\s*%\})",
                           lambda m, r=rep: m.group(1) + r + m.group(2), text)
        n += c1 + c2 + c3
    for old, new in sorted(ROUTES.items(), key=lambda kv: -len(kv[0])):
        text, c = re.subn(r"\b" + re.escape(old) + r"\b", new.replace("\\", "\\\\"), text)
        n += c
    for old, new in WORDY_ROUTES.items():
        text, c1 = re.subn("'" + old + "'", "'" + new + "'", text)
        text, c2 = re.subn("#" + old + r"\b", "#" + new, text)
        n += c1 + c2
    return text, n


def targets():
    out = []
    for dirpath, _dirs, files in os.walk(SCREENS):
        out += [os.path.join(dirpath, f) for f in sorted(files) if f.endswith(".html")]
    for sub in ("js", "css", "config", "mock"):
        d = os.path.join(ROOT, sub)
        if os.path.isdir(d):
            out += [os.path.join(d, f) for f in sorted(os.listdir(d))
                    if (f.endswith(".js") or f.endswith(".css")) and f != "templates.js"]
    for f in ("styleguide.html", "index.html"):
        p = os.path.join(ROOT, f)
        if os.path.exists(p):
            out.append(p)
    return out


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
        sys.exit("Khong tim thay thu muc screens/")

    moved = rename_files(git_ok())
    print("Doi ten %d file." % moved)

    touched = total = 0
    for path in targets():
        with open(path, encoding="utf-8") as f:
            src = f.read()
        new, n = rewrite(src)
        if n:
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(new)
            touched += 1
            total += n
            print("  %-42s %d thay the" % (os.path.relpath(path, ROOT).replace(os.sep, "/"), n))

    count = write_manifest()
    print("\n%d file sua, %d thay the, manifest %d template." % (touched, total, count))
    print("Buoc tiep theo:")
    print("  node docs/check-templates.js")
    print("  python build.py")


if __name__ == "__main__":
    main()
