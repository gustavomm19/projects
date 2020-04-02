const sharp = require('sharp')
sharp.simd(false)
sharp.cache(false)
const { createFilePath } = require(`gatsby-source-filesystem`);
const path = require("path");
const fetch = require('node-fetch');

exports.createPages = async ({ actions, graphql }) => {
    const { createPage } = actions;
    let projects = [];
    const resp = await fetch('https://assets.breatheco.de/apis/project/all');
    if(resp.status >=200 && resp.status <400){
        projects = await resp.json();
    }
    let technologyTags = [];
    for(let i = 0;i<projects.length;i++){
        if(typeof(projects[i].technology) === 'string') technologyTags.push(projects[i].technology);
        if(Array.isArray(projects[i].technologies)) technologyTags = technologyTags.concat(projects[i].technologies);
    }
    technologyTags = [...new Set(technologyTags)];

    createPage({

        path: `/`,
        component: path.resolve("./src/templates/home.js"),
        context: {
            technologyTags,
            projects: projects.filter(p => !p.visibility || p.visibility === "public")
        },
    })

    projects.forEach(p => {

        if(typeof(p.title) === "string" && p.title !== "")
            p.title = "Coding Tutorial - " + p.title;
            
        if(typeof(p.description) !== "string" || p.description === "")
        p.description = "BreatheCode Coding Projects tutorials and exercises for people learning to code or improving their coding skills";
        if(typeof(p.preview) !== "string" || p.preview === "")
        p.preview = "https://ucarecdn.com/03b6cba5-457e-474c-b4e3-7ea65f3b3375/";

        if(typeof(p.difficulty) === "string" && p.difficulty !== "" && p.name !== "p"){
            p.canonicalPath = `/interactive-coding-tutorial/${p.difficulty}/${p.slug}`;
        }
        else{
            p.canonicalPath = `/project/${p.slug}`;
        }
        p.url = `https://projects.breatheco.de${p.canonicalPath}`;
        
        
        console.log("Create page for project: "+p.canonicalPath);
        createPage({
            path: p.canonicalPath,
            component: path.resolve("./src/templates/single.js"),
            context: p,
        });
        if(p.canonicalPath !== `/project/${p.slug}`){
            createPage({
                path: `/project/${p.slug}`,
                component: path.resolve("./src/templates/single.js"),
                context: p,
            });
        }
        createPage({
            path: `/d/${p.slug}`,
            component: path.resolve("./src/templates/single.js"),
            context: p,
        });
    });

    return true;

};
