//load module
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const { isRegExp } = require('util');

const templateHTML = (title, list, body, control) => {
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
    </body>
    </html>
    `;
}

const templateList = (files) => {
    let list = '<ul>';
    let i = 0;
    while(i < files.length){
        list += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
        i += 1;
    }
    list += '</ul>';

    return list;
}

const app = http.createServer((request, response) => {
const _url = request.url;

//parsing url
const queryData = url.parse(_url, true).query; //querystring을 객체형태로 가져옴.
const pathname = url.parse(_url, true).pathname; //path
let title = queryData.id;

if(pathname === '/'){
    if(title === undefined){
        fs.readdir('./data', (err, files) => {
            const list = templateList(files);
            title = 'Welcome';
            description = 'Hello Node.js';
            const template = templateHTML(title, list, 
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>`
                );

            response.writeHead(200);
            response.end(template);
        })

    }else{
        fs.readdir('./data', (err, files) => {
            fs.readFile(`data/${title}`, 'utf8', (err, description) => {
                const list = templateList(files);
                const template = templateHTML(title, list, 
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                    );
                response.writeHead(200);
                response.end(template);
            });
        });
    }

}else if(pathname === '/create'){
    fs.readdir('./data', (err, files) => {
        const list = templateList(files);
        title = 'WEB - create';
        const template = templateHTML(title, list, 
            `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `,
            ``);

        response.writeHead(200);
        response.end(template);
    })
}else if(pathname === '/create_process'){
    let body = '';

    request.on('data', (data) => {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            request.connection.destroy();
    });

    request.on('end', () => {
        const post = qs.parse(body);
        let title = post.title;
        let description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
            if(err)
                throw err;
            console.log('the file has been saved.');
            response.writeHead(302,
                {
                    Location: `/?id=${title}`
                }
                );
                response.end();
        })
    });
    
}else if(pathname === '/update'){
    fs.readdir('./data', (err, files) => {
        fs.readFile(`data/${title}`, 'utf8', (err, description) => {
            const list = templateList(files);
            const template = templateHTML(title, list, 
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
            response.writeHead(200);
            response.end(template);
        });
    });
}else if(pathname === '/update_process'){
    let body = '';

    request.on('data', (data) => {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            request.connection.destroy();
    });

    request.on('end', () => {
        const post = qs.parse(body);
        const id = post.id;
        const title = post.title;
        const description = post.description;
        console.log(post);
        fs.renameSync(`data/${id}`, `data/${title}`)
        
        fs.writeFileSync(`data/${title}`, description, 'utf8');

        response.writeHead(302,
            {
                Location: `/?id=${title}`
            }
            );
        response.end();
    });
    
}else{
    response.writeHead(404);
    response.end('Not Found');
}
});
app.listen(3000);