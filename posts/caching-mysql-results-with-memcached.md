{{{
  "title": "Caching MySQL results with memcached",
  "tags": ["MySQL", "PHP", "memcached", "cache"],
  "category":"blog",
  "date": "Sun, 22 Apr 2012 23:14:09 GMT",
  "color":"pink"
}}}

This article shows how to implement resultset caching with PHP and Memcache. I will talk about the design of such a caching systemin an open source shop system (Prestashop 1.4.6.2), about what can be learned from this implementation and what can be improved.The resulting system uses the LRU principle of Memcache and is currently used by applerel, an online clothes shop that I am working on.
<!--more-->
## Setting up memcache

First we have to install and run memcache on our system. On our website ([applerel](http://applerel.ru) UPDATE:The page is no longer online), we use two instances with 256MB each. I would supposethat for most applications one instance with 64MB is enough but you can easily prove that with some load tests. Installing memcache on ubuntu is quite easy and just requires a few lines on your console:

    sudo apt-get install memcached
    sudo /etc/init.d/memcached start
    sudo apt-get install php5-memcache

If you want, you can also install the newer memcached library for php. 

    sudo apt-get install php5-memcached

Now you can start using memcache in your application:

    $memcache = new Memcache();
    //call connect with the host name and the port
    $memcache->connect('localhost', 11211) or die ("Could not connect");
    //set the value with the given key, no flags and expiry time (0 = never)
    $memcache->set($key, $value, false, 0);
    $cachedValue = $memcache->get($key);

## 

## Database abstraction layer

As many other frameworks, Prestashop uses a database abstraction layer to make access to the database a little bit more reliable and better to maintain. Those are the best conditions to implement caching for result sets as all the queries will be routed through the sameclasses. 

## 

## The initial implementation

To be able to cache the result of database queries, one must fetch the complete result set and store that with a fitting key into the application cache. In Prestashop they fetched the complete result set using an associative array:

    $resultArray = array();
    while ($row = mysql_fetch_assoc($result)) {
        $resultArray[] = $row;
    }

We could argue that this is not the best way in all the cases but it is simple and provides an easy method to fetch the result set in a generic manner and let all parts of your application access it later on. After fetching the result set you only have to put it to your cache.

The main problem with caches is to keep them up to date and to know when it is time to invalidate the values in the cache and load them from the database. In Prestashop they explicitly invalidated the values when somebody issued a query that would alter the result set. This is verydifficult because you might not always know when someone updates your database in a way that your result set has to be cleared from the cache.Such an untracked alteration might happen in a 3rd party module, some administrators changing the database on the server or even some programmers not completely understanding your API. It might also happen if your algorithm does not track all the tables involved in your queryand therefore it will not know when exactly the cached result needs to be invalidated.

## LRU, invalidation and cache namespaces

A solution for the last problem is to let the LRU principle of the cache work for you and you only invalidate the cached result sets by altering the cache key. You also have to know when somebody issues a modifying query that should invalidate your result set. In order to achieve that you have to use cache namespaces for every table. With a namespace per table we could easily invalidate all queries thatdepend on that table by invalidating the whole namespace.

Unfortunately memcache does not support namespaces out of the box and so we have to implement our own by integrating them intoour cache keys. There is a simple trick to do this:

    private function getTableNamespacePrefix($table) {
        $key = "NS".$table;
        $namespace = $this->_memcacheObj->get($key);
        if (!$namespace) {
            $namespace = time();
            if ($this->_memcacheObj->add($key, $namespace)) {
                //Lost the race. Need to refetch namespace.
                $this->_memcacheObj->get($key);
            }
        }
        return $namespace;
    }

We use a value that can quickly can altered/invalidated by memcache and is as specific enough for our application. Since memcache has a functionthat can increment stored values it is recommended to use a numeric value. A timestamp might just be the right choice to initialize our namespace. Every time we want to invalidate the whole namespace, we just have to increment this namespace object.
    
    private function invalidateNamespace($table) {
        $key = "NS".$table;
        if (!$this->_memcacheObj->increment($key)) {
            $this->_memcacheObj->add($key, time());
        }
    }

Now we have the function to get the namespace key prefix and the function to invalidate the namespace. The next step is to find the tablesour queries depend on to calculate the namespace(es) for our query. In Prestashop that is quite easy, because every table name is prefixed with a global table prefix. We simply use a regular expression on the query and we get all the tables used in the query.

    private function getTables($query) {
        if (preg_match_all('/('._DB_PREFIX_.'[a-z_-]*)`?.*/im', $query, $res))
            return $res[1];
        return false;
    }

To find our when we have to invalidate a namespace we analyze all queries that are passed through our database abstraction layer and scan forqueries that will make changes to the database.
    
    public function checkQuery($query) {
        if (preg_match('/INSERT|UPDATE|DELETE|DROP|REPLACE/im', $query, $qtype)) {
            $this->deleteQuery($query);
        }
    }
    
    public function deleteQuery($query) {
        if (!$this->_isConnected)
            return false;
        $tables = $this->getTables($query);
        foreach($tables AS $table) {
            $this->invalidateNamespace($table);
        }
    }

We not have a working result set cache based on memcache in PHP. 

You can find the complete implementation for [Prestashop](http://prestashop.com) (1.4.6.2) on my github repository: [https://github.com/csupnig/Prestashop-Memcached-Fix](https://github.com/csupnig/Prestashop-Memcached-Fix)

Please feel free to ask questions or make suggestions!

