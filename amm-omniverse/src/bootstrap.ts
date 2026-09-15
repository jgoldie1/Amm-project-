const path=window.location.pathname

if(path==='/streetverse'||path==='/streetverse/'){
 void import('./streetverse-entry')
}else{
 void import('./main')
}
