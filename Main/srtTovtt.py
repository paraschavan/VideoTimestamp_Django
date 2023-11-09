import glob
import re
import uuid
import os
def getJSON(prefix,path,name,video):
    allData = []
    files = glob.glob(rf'{path}{prefix}*.srt')
    print(files)
    for file in files:
        file_size = os.path.getsize(file)
        # print("File Size is :", file_size, "bytes")
        if file_size > 399000:
            continue
        node = {}
        node['id'] = str(uuid.uuid1())
        node['video'] = name
        regex =  r'\_(.*?)\.'
        match = re.search(regex, file)
        if match or file:
            if match:
                lang = match.group(0)[1:-1]
            else:
                lang = 'default'
            print(lang)
            header = 'WEBVTT FILE\n'
            with open(file, 'r', encoding='utf-8') as f:
                data = [i for i in f.readlines()]
            if not data:
                continue
            pattern = '\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d'
            sub = []
            if not header in data[0]:
                data = [header] + data
            for d in data:
                if d.strip().isnumeric():
                    continue
                match = re.search(pattern, d)
                if match:
                    sub.append(match.group(0).replace(',', '.') + '\n')
                else:
                    sub.append(d)
            sub = ''.join([s for s in sub])
            if sub:
                node['lg'] = [lang[:30],sub]
                allData.append(node)
    # Delete after getting json
    if not __name__ == '__main__':
        for file in files:
            try:
                os.remove(file)
            except:
                print("Error while deleting file : ", file)
        try:
            os.remove(video)
        except:
            print("Error while deleting Video : ", file)
    return allData
