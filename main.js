const { func, array } = require('assert-plus');
const pdfkit = require('pdfkit')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const request = require('request');
const { fstat } = require('fs');
const PDFDocument = require('pdfkit');
const link = 'https://github.com/topics';
// fetching three topic  
request(link,mytopic)
function mytopic(error, response , body){
    if(error){
      console.error("error: ",error)
    }
    else if(response.statusCode == 404){
        console.log('page not found!!')
    }
    else{
      get_topic_link(body)
    }
}
function get_topic_link(html_body){
    let $ = cheerio.load(html_body);
    let topics_arr = $(".hover-grow.height-full.text-center .no-underline ");
    // console.log(topics_arr.length)
    for(let i =0; i<topics_arr.length; i++){
       let topic_link = $(topics_arr[i]).attr('href');
         topic_link = link.split(".com")[0] +".com"+topic_link;
         console.log(topic_link)
        get_repo_list(topic_link)
         
    }
}
// fething Repository page 
function get_repo_list(topic_link){
    request(topic_link,get_topic_list)
    function get_topic_list(error, response , body){
        if(error){
            console.error("error: ",error)
          }
          else if(response.statusCode == 404){
            console.log('page not found!!')
        }
          else{
            let $ = cheerio.load(body);
            let topics_arr = $(".border.rounded.color-shadow-small.color-bg-subtle.my-4 ");
            let topic_name = $('.col-sm-10.d-flex.flex-items-center.mb-3.mb-sm-0 .h1').text()
                topic_name = topic_name.trim()
            console.log(topic_name)
            for(let i=0; i<10; i++){
                // repo name
                let repo_dir = $(topics_arr[i]).find(".f3.color-fg-muted.text-normal.lh-condensed").find('a')[0]
                 repo_dir = $(repo_dir).text()
                let repo_name =  $(topics_arr[i]).find(".f3.color-fg-muted.text-normal.lh-condensed").find('a')[1]
                repo_name = $(repo_name).text()
                 repo_name = repo_dir.trim()+"_"+repo_name.trim()
                
                // getting issue link
                let issue_linkArr = $(topics_arr[i]).find(".tabnav-tab.f6.px-2.py-1")
                let issue_link = $(issue_linkArr[1]).attr('href')
                    issue_link = link.split(".com")[0]+".com"+issue_link
                
                // console.log(repo_name)
                // console.log(issue_link)
                get_topic_data(issue_link,topic_name,repo_name)
            } 
             
    
          }
    }
    

}
// fetching issue page
function get_topic_data(issue_link,topic_name,repo_name){
    request(issue_link,get_topic_data_link)
    function get_topic_data_link(error, response, body){
        if(error){
            console.error("error:",error)
        }
        else if(response.statusCode == 404){
            console.log('page not found!!')
        }
        else{
            let arr=[]
            let $ = cheerio.load(body);
            let topics_link_arr = $(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
            let folder_path = path.join(__dirname,topic_name)
            let file_path = path.join(folder_path,repo_name)
           // for read stream
            if(!fs.existsSync(folder_path)){
                fs.mkdirSync(folder_path)
            }
            // pdfDoc
            let pdfDoc = new PDFDocument;
            // writing in stream
            pdfDoc.pipe(fs.createWriteStream(file_path+".pdf"));
            pdfDoc.text(topic_name,{ align: 'center'});
            pdfDoc.text(" ");
            for(let i =0; i<topics_link_arr.length; i++){
                 let href = $(topics_link_arr[i]).attr('href')
                //  for description
                 let details = $(topics_link_arr[i]).text()
                 href = link.split(".com")[0]+".com"+href
                 pdfDoc.text((i+1)+".Issue link : "+href,{ align: 'left'});
                 pdfDoc.text("  Issue description : "+details,{ align: 'left'});
                 pdfDoc.text(" ");
                //  console.log(href)
                // for converting into json data
                // arr.push({
                //     'link': href,
                //     'description': details
                // })
            }
            pdfDoc.end();

            // for creating json file
            // create_dir(folder_path,file_path,arr)
        }
    }
}
// creating json file
// function create_dir(folder_path, file_path,arr){
//     if(!fs.existsSync(folder_path)){
//         fs.mkdirSync(folder_path)
//     }
//     fs.writeFileSync(file_path+".json",JSON.stringify(arr));
// }