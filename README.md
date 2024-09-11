# 随机单词
chrome extensions

## grunt
Grunt是一个基于Node.js的JavaScript任务运行器,主要用于前端Web开发的自动化工具。

Grunt能够帮助开发者自动完成许多重复性的任务,例如:

合并、压缩、编译JavaScript、CSS文件
语法检查(linting)
自动刷新浏览器
简化重复性劳动(如打包、压缩等)
自动化测试
Grunt遵循配置优于代码的理念,主要组件如下:

Grunt CLI - 命令行接口,用于运行Grunt任务
Gruntfile - 包含任务配置的文件
Plugins - 完成具体任务的插件
tasks - 通过配置Gruntfile中定义的任务
工作流程大致如下:

开发者根据需要配置Gruntfile.js文件
通过Grunt CLI运行特定的task,Grunt会加载Gruntfile文件
Grunt根据Gruntfile的配置调用指定的Plugin完成task
插件执行后返回结果给Grunt
Grunt将结果显示到console上
综上,Grunt是一个前端自动化构建工具,通过管理任务和插件可以大幅减少重复劳动,从而提高工作效率。它简化了开发的流程,已成为前端开发不可缺少的工具。

## grunt命令

grunt crxTask : 打包crx文件


manifest.json： 插件的配置文件，定义了插件的名称、版本、权限、图标等信息。
background.js： 后台脚本，在插件安装后一直运行，负责监听事件、处理消息等。
content.js： 内容脚本，注入到网页中执行，可以修改网页内容、样式等。
popup.html： 弹出页面，用户点击插件图标时显示。