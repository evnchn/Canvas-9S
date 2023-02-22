import_string = \
'''
from jsmin import jsmin
import glob
'''
### LINK START! (https://github.com/evnchn/linkstart.py)
for line in import_string.splitlines():
    if "import" in line:
        print(line)
        try:
            exec(line)
        except:
            if "#" in line:
                package_name = line.split("#")[-1]
            else:
                splits = line.split("import")
                if "from" in line:
                    package_name = splits[0].replace("from","")
                else:
                    package_name = splits[1]
            package_name = package_name.strip()
            print("Installing {}...".format(package_name))    
            import subprocess
            import sys
            subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
            try:
                exec(line)
            except:
                print("Failed to install {}".format(package_name))
### DONE

all_js = []

for js_file_name in glob.glob("*.js"):
    if ".min." not in js_file_name:
        with open(js_file_name, encoding="utf-8") as js_file:
            minified = jsmin(js_file.read())
        all_js.append(minified)
        with open("{}.min.js".format(js_file_name), "w", encoding="utf-8") as min_js_file:
            min_js_file.write(minified)
            
            
with open("all.min.js", "w", encoding="utf-8") as min_js_file:
    min_js_file.write("\n".join(all_js))