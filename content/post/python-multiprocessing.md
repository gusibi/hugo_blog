+++
date = "2016-09-05T17:36:51+08:00"
draft = true
title = "python multiprocessing"

+++

## multiprocessing

```
from multiprocessing import Pool

def f(x):
	return x*x

if __name__ == '__main__':
    p = Pool(5)
	print (p.map(f, [1, 2, 3]))
```
