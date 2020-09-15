# ep_standups
Etherpad lite plugin to generate a daily or weekly group standup pad with the date in the name

http://someetherpad.com/daily/\<group\>   => `/p/\<group\>-\<year\>-\<month\>-\<day\>` (current date)
http://someetherpad.com/weekly/\<group\>   => `/p/\<group\>-\<year\>-\<month\>-\<day\>` (date of the Monday of the current week)

Pads are created blank or from a default PAD `<group>-default`

## Front Page Links
Adding the followint to the settings will create front page shortcuts to standups

```JSON
"ep_standups": {
    "Team Name 1": { 
        "type": "d",
        "group": "tn1"
    },
    "Team Name 2": { 
        "type": "w",
        "group": "tn2"
    },

}

```

The name of the team given will be shown on the front page, that will link to either the daily or weekly URL using the defined group short code.