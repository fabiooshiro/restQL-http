# How to Contribute

## First Steps
If you want to contribute with RestQL, the first thing you should do is [set up your development environment](/restql/howToDev).

## Openning issues
If you spot a bug or have a feature to suggest, please open an issue at the [restQL-http Project](https://github.com/B2W-BIT/restQL-http/), even if the issue refers to [restQL-clojure](https://github.com/B2W-BIT/restQL-clojure/) or [restQL-manager](https://github.com/B2W-BIT/restQL-manager/). Keeping all the issues in one place makes it easier to track bugs and suggestions.

## Commit message conventions
The format of commit messages in RestQL is based on [AngularJS Git Commit Message Conventions](https://gist.github.com/stephenparish/9941e89d80e2bc58a153) and should look like this:

```
refactor(query): split request/util.clj and it's tests (#91)
```
Where the number in parenthesis at the end of the commit message refers to the number of the issue the commit is related to.

## Pull requests
When you open a **pull request**, please request the review from one of the major contributors:
* [Lucas Barros](https://github.com/lucasbarros)
* [Rafael Cupello](https://github.com/cupello)
* [Ricardo Mayerhorfer](https://github.com/ricardoekm)
* [Rodrigo Machado](https://github.com/machadolhes)

## Documentation
It would be nice if any changes you made on the code came along with a snippet of documentation, this would help keeping the project well-documented for other people to use and contribute. 

## Code
Details on the code will be reviewed by one of the major contributors, but there are basic tips we follow when we code:

* Write tests
* Keep the code clean
* Refactor if you think it's necessary
* The Boy Scout Rule: Leave things better than you found them