    			`/* Workflow variables are stored in 'kvars', following code shows how to get the value of a workflow variable named   'days':
    let tmp = kvars.days.value

To set workflow vaiables, put them into 'retkvars' object, for example:
retkvars={days: 30, reason:'go hospital', friends: ['Andy','Lisa']};
This node's return value is in "ret".
You may use "EMP" to access Hyperflow APIs or access a thirdparty web API.
see Hyperflow Worflow Developer's Guide for details.
Please use "kvars", "retkvars", "ret" and "EMP" directly, don't re-declare them. \*/
