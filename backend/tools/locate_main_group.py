import io,sys
p='c:/Users/Lenovo/jumpstart-platform/backend/jyc_apps/chat/views.py'
with io.open(p,'r',encoding='utf-8') as f:
    lines=f.readlines()
    for i in range(328,342):
        print(i, repr(lines[i-1]))
