p='c:/Users/Lenovo/jumpstart-platform/backend/jyc_apps/chat/views.py'
with open(p,'rb') as f:
    data=f.read()
print('FILE SIZE:',len(data))
# print a range of bytes around 3000-4000
start=3000
end=3800
print(data[start:end])
# print occurrences of 'Main Workspace' and surrounding context
s=b'Main Workspace'
for idx in range(max(0,data.find(s)-50),min(len(data),data.find(s)+50)):
    pass
pos=data.find(s)
print('pos',pos)
if pos!=-1:
    print(data[pos-200:pos+200])
