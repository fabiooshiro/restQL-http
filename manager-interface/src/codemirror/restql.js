import CodeMirror from 'codemirror';

// Language reserved words
const languageTokenList = ['from','as','headers','timeout','with','only','hidden'];
const languageOperatorsList = ['flatten','expand','contract','json'];

(function(mod) {
    mod(CodeMirror);
})(function(CodeMirror) {

  CodeMirror.registerHelper("hint", "anyword", function(editor, options) {

    let list = [].concat(languageTokenList);

    let cursor = editor.getCursor(), currentLine = editor.getLine(cursor.line);
    
    // Resources matching
    let fromRegex = new RegExp(/from ([\w-_$]+)/);
    let aliasRegex = new RegExp(/as ([\w-_$]+)/);
    
    let firstLine = editor.firstLine();
    let lastLine = editor.lastLine();

    let resourcesList = [];

    // Context completion variables
    let lastFrom = -1;

    for(let i=firstLine; i<=lastLine; i++) {
      // We get each line
      let nextLine = editor.getLine(i);
      
      // And lookup for matches
      let fromMatches = fromRegex.exec(nextLine);
      let aliasMatches = aliasRegex.exec(nextLine);

      // If alias, we complete alias, otherwise we complete the resource name
      if(aliasMatches != null && aliasMatches.length >= 2)
        resourcesList.push(aliasMatches[1]);
      else if(fromMatches != null && fromMatches.length >= 2)
        resourcesList.push(fromMatches[1]);
        
      // Gets the last position of the known "from" as upper boundary for context completion
      lastFrom = (nextLine.indexOf('from') !== -1 ? i : lastFrom);
    }

    // The lower boundary to look for language tokens
    let fromBeforeCursor = 0;
    let i = cursor.line;

    // Iterates from the cursor to the last 'from' clause typed
    // or stop if it reaches the beginning of the editor.
    while(fromBeforeCursor === 0 && i >= 0) {
      const nextLine = editor.getLine(i);
      fromBeforeCursor = (nextLine.indexOf('from') !== -1 ? i : 0);
      
      i--;
    }

    // The upper boundary to look for language tokens
    const stopAt = cursor.line;

    // The last token on our list
    let lastTokenCount = 0;

    // We iterate over each line to see if the token is present
    for(let i=fromBeforeCursor; i<=stopAt; i++) {
      const nextLine = editor.getLine(i);

      languageTokenList.forEach((val, index)=>{
        if(nextLine.indexOf(val) !== -1)
          lastTokenCount = index;
      });
    }

    // We concatenate on the last known token until current line and append operators
    list = ['from'].concat(list.splice(lastTokenCount+1)).concat(languageOperatorsList);

    // Concatenating the resources and aliases
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
