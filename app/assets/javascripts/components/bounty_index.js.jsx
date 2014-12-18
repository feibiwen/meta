/** @jsx React.DOM */

(function() {
  var Accordion = require('./accordion.js.jsx')
  var BountiesStore = require('../stores/bounties_store.js')
  var BountyActionCreators = require('../actions/bounty_action_creators.js')
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')
  var PaginationLinks = require('./pagination_links.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var BountyIndex = React.createClass({
    propTypes: {
      tags: React.PropTypes.object,
      assets: React.PropTypes.object,
      pages: React.PropTypes.number,
      product: React.PropTypes.object,
      valuation: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        value: 'is:open',
        sort: 'priority'
      }
    },

    componentDidMount: function() {
      window.addEventListener('scroll', this.onScroll);
    },

    componentWillUnmount: function() {
      window.removeEventListener('scroll', this.onScroll);
    },

    onScroll: function() {
      var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

      if (atBottom) {
        BountyActionCreators.requestNextPage(
          this.props.product.slug,
          this.params(this.state.value, this.state.sort)
        )
      }
    },

    getBounties: function(value, sort, page) {
      BountyActionCreators.requestBountiesDebounced(
        this.props.product.slug,
        this.params(value, sort, page)
      )
    },

    handleValueChange: function(event) {
      var value = event.target.value

      this.setState({ value: value })

      this.getBounties(value, this.state.sort, 1)
    },

    handleSortChange: function(event) {
      var sort = event.target.value

      this.setState({ sort: sort })

      this.getBounties(this.state.value, sort, 1)
    },

    handlePageChange: function(page) {
      this.getBounties(this.state.value, this.state.sort, page)
    },

    addTag: function(tag) {
      return function(event) {
        var value = this.state.value + ' ' + 'tag:' + tag

        this.setState({ value: value })

        this.getBounties(value, this.state.sort, 1)
      }.bind(this)
    },

    renderTags: function() {
      return this.props.tags.map(function(tag) {
        return (
          <li className="mb1 lh0_9">
            <a href="#" className="pill-hover block pt1 pb1 pr3 pl3" onClick={this.addTag(tag)}>
              <span className="fs1 fw-500 caps">#{tag}</span>
            </a>
          </li>
        )
      }.bind(this))
    },

    renderAssets: function() {
      var assets = this.props.assets
      var product = this.props.product
      var assets_url = product.url+'/assets'

      return (
        <ul className="list-reset mn3 mtn1 mb1">
          {assets.map(function(asset) {
            return (
              <li className="inline-block w100p pt1 pr1 pl1 r480_w50p r768_w100p r1024_w50p">
                <a href={assets_url} className="inline-block w100p">
                  <div className="w100p pb66p bg-size-cover bg-repeat-none bg-position-center" style={{backgroundImage: 'url('+ asset.thumbnail_url +')', backgroundColor: '#dbdee3' }}></div>
                </a>
              </li>
            )
          })}
        </ul>
      )
    },

    render: function() {
      var bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      var product = this.props.product

      if (typeof product === "undefined" || product === null) {
        return null;
      }

      return (
        <div className="row">
          <div className="col-xs-12 col-sm-4 r768_float-right">
            <span className="col-sm-11 col-sm-push-1 p0">
              <div className="bg-white rounded shadow pt3 pr3 pb4 pl3 mb2" style={{paddingLeft: '1.75rem'}}>
                <div className="block h5 mt0 mb1 bold">
                  Getting Started
                </div>
                <div className="h6 m0 gray-1">
                  Updates are a great way to keep new contributors up to date
                  with progress and new ways to help out. When you are ready,
                  we'll also email the entry to everyone following
                  <span>{product.name}</span>. You can include images and
                  use Markdown to make it more awesome.
                </div>
              </div>
              <div className="col-xs-6 col-sm-12">
                <div className="pb1"> {/*Tags*/}
                  <Accordion title="Tags">
                    <ul className="list-reset mxn2">
                      {this.renderTags()}
                    </ul>
                  </Accordion>
                </div>
              </div>
              <div className="col-xs-6 col-sm-12">
                <div className="mb1"> {/*Assets*/}
                  <Accordion title="Assets" >
                    {this.renderAssets()}
                  </Accordion>
                </div>
              </div>
            </span>
          </div>
          <div className="col-xs-12 col-sm-8 r768_pr0">
            <BountyFilter {...bountyFilterProps} value={this.state.value} onValueChange={this.handleValueChange} sort={this.state.sort} onSortChange={this.handleSortChange} />
            <BountyList product={this.props.product} valuation={this.props.valuation} onPageChange={this.handlePageChange} draggable={this.draggable()} />
          </div>
        </div>
      )
    },

    params: function(value, sort, page) {
      var terms = value.split(' ')

      var params = _.reduce(terms, function(memo, value) {
        var filter = value.split(':')

        if (filter.length == 2) {
          memo[filter[0]] = _.compact(_.flatten([memo[filter[0]], filter[1]]))
        } else {
          memo.query = _.compact([memo.query, value]).join(' ')
        }

        return memo
      }, {})

      var renames = { is: 'state', by: 'created' }

      params = _.reduce(params, function(result, value, key) {
        key = renames[key] || key
        result[key] = value
        return result
      }, {});

      params.sort = sort
      params.page = page

      return params
    },

    draggable: function() {
      if(!this.props.product.can_update) {
        return false
      }

      var params = this.params(this.state.value, this.state.sort)
      return params.sort == 'priority' && params.state == 'open'
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
