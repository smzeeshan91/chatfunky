<p>Chatfunky is not only a web based chatting application but my first startup in which I failed badly in 2017.</p>
<p>&nbsp;</p>
<p>I worked on this project from May 2016 till June 2017, put my best efforts and investments on it but failed to resolved bugs and targeting a reasonable audience.&nbsp;</p>
<p>As the application grew, it gets very difficult for me to handle the application alone as I am individually supporting all things, designing, coding, testing, deployment, server configuration, marketing, social media presence, search engine optimization and mobile app as well.</p>
<p>Therefore now I am open sourcing this application to the World so that any developer can be benefited by its code and enhance it and try to resolve the bugs that I failed to do so.</p>
<p>Now come up to the technical part ;p</p>
<p>&nbsp;</p>
<p><strong>Technologies Used:</strong><br /><br />ASP.NET MVC 5</p>
<p>C#</p>
<p>HTML 5 / CSS 3 / Bootstrap 4 / JQuery 3</p>
<p>Microsoft SignalR (for web socket communication)</p>
<p>Microsoft Web Sockets (if SignalR drops)</p>
<p>HTML Compressor (for compressing HTML code at client side)</p>
<p>OWIN</p>
<p>&nbsp;</p>
<p><strong>How to Use:</strong></p>
<ul>
<li>Web.config changes:</li>
</ul>
<ol>
<li style="padding-left: 30px;">Change Key "Domain" according to your hosting domain.</li>
<li style="padding-left: 30px;">Change Keys for "Email, Password, SMTPClient and Port" according to your desired ones.</li>
<li style="padding-left: 30px;">I have made custom errors "Off" so that if any error comes so you can see it directly. Therefore after setting up the project, you can turn custom errors off.</li>
</ol>
<p>&nbsp;</p>
<ul>
<li>Sitemap.xml and Robots.txt</li>
</ul>
<ol>
<li>There is an old live website url in both of these files, that you may change if you deploy it on live according to your domain.</li>
</ol>
<p>&nbsp;</p>
<ul>
<li>Restoring Database</li>
</ul>
<ol>
<li>There is a "CreateDB Script.txt" file in this project. Please create a blank Database with name "ChatfunkyDB" and then run this script to that database. It will create all tables and related stored procedures to the database automatically.</li>
</ol>
<p>&nbsp;</p>
<ul>
<li>socket.js</li>
</ul>
<ol>
<li>There is one file named socket.js under "Content/js" folder. This file is used by Microsoft.WebSockets.dll and pointing to the domain url to make connectivity to the socket server. Please change the domain url as yours.</li>
</ol>
<p>&nbsp;</p>
<p>Now after all of these settings you are good to go, just press f5 to run the project and then you will see a web socket (SignalR and core web socket) based chatting application.&nbsp;</p>
<p>&nbsp;</p>
<p>I used SignalR and Microsoft Web Socket in this application because during the development of this project I found that SIgnalR won't be able to maintain its connection if the internet speed drops to 200 kbps. Since my concern is to make the application reliable so that even the slowest speed user be able to chat without any interruptions. Therefore I resolve this issue by using Microsoft Web Sockets. After that the application will handle automatically if SignalR drops and make its connection with Microsoft Web Socket and continue to ping to server to get back the connection of SignalR. If internet speed raise again to achieve at least 500 kbps then it connects with SignalR again. Hence it automatically switch between SignalR and Microsoft Web Sockets and the user won't feel any interruption in this case.</p>
<p>&nbsp;</p>
