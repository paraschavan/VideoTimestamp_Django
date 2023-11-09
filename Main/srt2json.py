import glob
import re
import uuid


def getJSON(prefix,path,name):

    data = []
    files = glob.glob(rf'{path}{prefix}*.srt')
    print(files)
    for file in files:
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
            regex = r'(?:\d+)\s(\d+:\d+:\d+,\d+) --> (\d+:\d+:\d+,\d+)\s+(.+?)(?:\n\n|$)'
            offset_seconds = lambda ts: sum(
                howmany * sec for howmany, sec in zip(map(int, ts.replace(',', ':').split(':')), [60 * 60, 60, 1, 1e-3]))

            transcript = [dict(startTime=offset_seconds(startTime), endTime=offset_seconds(endTime), ref=' '.join(ref.split()))
                          for startTime, endTime, ref in re.findall(regex, open(file,encoding="utf8").read(), re.DOTALL)]
            # print(transcript)
            if transcript:
                node['lg'] = [lang,transcript]
                data.append(node)
                print('==>')
                print(transcript)

    # Delete after getting json
    # for file in files:
    #     try:
    #         os.remove(file)
    #     except:
    #         print("Error while deleting file : ", file)
    return data
