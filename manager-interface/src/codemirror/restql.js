import CodeMirror from 'codemirror';

// Language reserved words
const languageList = ['from','as','headers','timeout','with','flatten','expand','contract','only','hidden'];

(function(mod) {
    mod(CodeMirror);
})(function(CodeMirror) {

  CodeMirror.registerHelper("hint", "anyword", function(editor, options) {

    let list = [].concat(languageList);

    let cursor = editor.getCursor(), currentLine = editor.getLine(cursor.line);
    
    // Resources matching
    let fromRegex = new RegExp(/from ([\w-_$]+)/);
    let aliasRegex = new RegExp(/as ([\w-_$]+)/);
    
    let firstLine = editor.firstLine();
    let lastLine = editor.lastLine();

    let resourcesList = [];

    for(let i=firstLine; i<=lastLine; i++) {
      // We get each line
      let nextLine = editor.getLine(i);
      
      // And lookup for matches
      let fromMatches = fromRegex.exec(nextLine);
      let aliasMatches = aliasRegex.exec(nextLine);

      if(fromMatches != null && fromMatches.length >= 2)
        resourcesList.push(fromMatches[1]);
        
      if(aliasMatches != null && aliasMatches.length >= 2)
        resourcesList.push(aliasMatches[1]);
    }

    list = list.concat(resourcesList);


    // Filtering
    let end = cursor.ch, start = end;
    while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
    while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
    let curWord = start !== end && currentLine.slice(start, end);

    
    let langRegex = new RegExp('^' + curWord, 'i');
    let langCompletion = (!curWord ? list : list.filter(function (item) {
        return item.match(langRegex);
    }));

    let result = {
        list: langCompletion,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end)
    };

    return result;
  });
});
