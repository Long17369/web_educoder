import json

class Main:
    def __init__(self):
        match int(input("按0开始生成HTML文件\n按1开始编辑章节\n按2手动编辑章节\n按3退出程序")):
            case 0:
                self.read_json('./main.json')
                HTMLGenerator(self.data, './test.html')
            case 1:
                self.read_json('./main.json')
                self.chapter_edit()
                self.save_json('./main.json')
            case 2:
                self.read_json('./main.json')
            case _:
                pass

    def read_json(self, file_path):
        with open(file_path, 'r') as f:
            self.data = json.load(f)
        return self.data

    def write_json(self, file_path):
        with open(file_path, 'w') as f:
            json.dump(self.data, f,ensure_ascii=False,indent=4)

    def save_json(self, file_path):
        self.write_json(file_path)

    def chapter_edit(self):
        print("开始编辑章节")
        ([print(f"{i['id']}: {i['title']}") for i in self.data['contents']])
        chapter_id = input("请输入章节ID：")
        for chapter in self.data['contents']:
            if chapter['id'] == chapter_id:
                print(f"当前章节：{chapter['title']}")
                match int(input("按1编辑标题\n按2编辑内容\n按3返回上一级菜单\n按4退出程序")):
                    case 1:
                        chapter['title'] = input("请输入新标题：")
                    case 2:
                        self.content_edit(chapter)
                    case 3:
                        return self.chapter_edit()
                    case _:
                        return
        else:
            print("输入的章节ID不存在")
            match int(input("是否要创建新章节？\n按1创建\n按2返回上一级菜单\n按3退出程序")):
                case 1:
                    id = len(self.data['contents']) + 1
                    title = input("请输入新章节标题：")
                    self.data['contents'].append({'id': id, 'title': title, 'content': []})
                case 2:
                    return self.chapter_edit()
                case _:
                    return

        match int(input("按1添加新章节\n按2返回上一级菜单\n按3退出程序")):
            case _:...

    def content_edit(self, chapter):
        print(f"当前内容：")
        [print(f"{i['id']}: {i['title']}") for i in chapter['contents']]
        id =  int(input("输入内容id"))
        for content in chapter['content']:
            if content['id'] == id:
                print(f"当前内容：{content['title']}")
                match int(input("按1编辑标题\n按2返回上一级菜单\n按3退出程序")):
                    case 1:
                        content['title'] = input("请输入新标题：")
                    case 2:
                        return self.chapter_edit()
                    case _:
                        return

    def add_content(self,chapter,data):
        id = len(self.data['contents'][chapter]['content'])
        for i in data:
            self.data['contents'][chapter]['content'].append({'title': i,'id': id,})
            id += 1

    def get_codes(self):
        codes:list[list[str]] = []
        for chapter in self.data['contents']:
            codes.append([])
            for content in chapter['content']:
                code = self.get_code(chapter['id'],content['id'])
                codes[-1].append(code)
        self.data['codes'] = codes

    def get_code(self,chapter_id,content_id):
        code = ""
        with open(f"./code/{chapter_id}_{content_id}.c", 'r') as f:
            ...
        return code

class HTMLGenerator:
    def __init__ (self,data,file_path):
        self.file_path = file_path
        self.data = data
        with open(self.file_path, 'w') as f:
            pass
        self.head()
        self.body()

    def head(self):
        self.write_html("<!DOCTYPE html>")
        self.write_html("<html lang='zh-CN'>")
        self.write_html("<head>")
        self.write_html(f"<title>{self.data['title']}</title>")
        self.write_html("<meta charset='UTF-8'>")
        self.write_html(f"<link rel='stylesheet' href='{self.data['stylesheet']}'>")
        self.write_html(f"<script src='{self.data['script'][0]}'></script>")
        self.write_html(f"<script src='{self.data['script'][1]}'></script>")
        self.write_html(f"<script src='{self.data['script'][2]}'></script>")
        self.write_html(f"<script src='{self.data['script'][3]}'></script>")
        self.write_html("</head>")

    def body(self):
        self.write_html("<body>")
        self.write_html(f"<h1>{self.data['title']}</h1>")
        self.write_html("""<span class="toggle-icon" onclick="toggleMenu(1)">▶</span>""")
        self.write_html("""<strong class="menu-title">目录</strong>""")
        self.write_html("<ul class='menu' id='menu-1'>")
        for chapter in self.data['contents']: # 章节目录
            self.write_html(f"<li><a href='#{chapter['id']}'>{int(chapter['id'])+1}:{chapter['title']}</a></li>")
        self.write_html("</ul><ul>")
        for chapter in self.data['contents']:
            self.write_html(f"<h3 id='{chapter['id']}' href='#{chapter['id']}' class='chapter-title'>{int(chapter['id'])+1}:{chapter['title']}</h3>")
            for content in chapter['content']: # 内容
                self.write_html(f"<div><a href='#{chapter['id']}_{content['id']}' id='{content['id']}' class='content-title'>{int(content['id'])+1}:{content['title']}</a></div>")
        self.write_html("</ul><ul>")
        for chapter in self.data['contents']:
            self.write_html("<ul>")
            for content in chapter['content']:
                self.write_html(f"<div id='{chapter['id']}_{content['id']}' class='content-content'>")
                self.write_html(f"<h4>{content['title']}</h4>")
                self.write_html(f"<li id='code_{chapter['id']}_{content['id']}' class='code_content'></li>")
                self.write_html(f"</div>")
            self.write_html("</ul>")
        self.write_html("</ul>")
        self.write_html("</body>")
        self.write_html("</html>")

    def write_html(self, data):
        with open(self.file_path, 'a') as f:
            print(data, file=f)

if __name__ == '__main__':
    a = Main()