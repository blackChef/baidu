##Getting start
node index, then open http://localhost:3000

##介绍
搜索关键字，显示百度上该关键字前五页的结果。可以按网址来源查看，方便知道 seo 的情况。

##特性
- 非常直观的界面。
- 优化了异步处理，速度快。

##技术特点
后端的功能只是抓取百度某一页的结果。前端会同时发出5个请求给后端，返回结果按顺序显示。  
例如返回结果时，第2页比第1页先返回，那么程序会等到第1页返回之后再同时显示第1和第2页。
