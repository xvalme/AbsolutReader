import os
import sys

to_replace = """(href="{% static 'assets)"""

file = r'C:\Users\Val\Desktop\AR\AbsolutReader\Server\ar\templates\index.html'


with open(file, 'r+') as f:

    lines = f.readlines() #List of every html line

    total = 0

    for line in lines:

        if '''href="assets''' in line:
            total += 1

            line.replace('''href="assets''', 'to_replace')    #Replacing first part
            line.replace(''' > ''', ''''%}"''') #Replacing final part

    f.writelines(lines)



print(str(total) + " edits")